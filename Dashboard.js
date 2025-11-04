// =====================================================
// frontend/src/components/Dashboard/Dashboard.js
// =====================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { eventsAPI } from '../../services/api';
import { format } from 'date-fns';

export const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    status: 'BUSY'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await eventsAPI.createEvent(formData);
      setShowModal(false);
      setFormData({ title: '', startTime: '', endTime: '', status: 'BUSY' });
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create event');
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await eventsAPI.updateEvent(eventId, { status: newStatus });
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.deleteEvent(eventId);
        fetchEvents();
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete event');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BUSY': return 'bg-gray-200 text-gray-800';
      case 'SWAPPABLE': return 'bg-green-200 text-green-800';
      case 'SWAP_PENDING': return 'bg-yellow-200 text-yellow-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Calendar</h1>
          <p className="text-gray-600">Welcome, {user.name}!</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          + Create Event
        </button>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No events yet. Create your first event!</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {format(new Date(event.start_time), 'PPpp')} - {format(new Date(event.end_time), 'p')}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {event.status === 'BUSY' && (
                    <button
                      onClick={() => handleStatusChange(event.id, 'SWAPPABLE')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Make Swappable
                    </button>
                  )}
                  {event.status === 'SWAPPABLE' && (
                    <button
                      onClick={() => handleStatusChange(event.id, 'BUSY')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      Make Busy
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="BUSY">Busy</option>
                    <option value="SWAPPABLE">Swappable</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ title: '', startTime: '', endTime: '', status: 'BUSY' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================
// frontend/src/components/Marketplace/Marketplace.js
// =====================================================

import React, { useState, useEffect } from 'react';
import { swapAPI, eventsAPI } from '../../services/api';
import { format } from 'date-fns';

export const Marketplace = () => {
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsResponse, eventsResponse] = await Promise.all([
        swapAPI.getSwappableSlots(),
        eventsAPI.getEvents()
      ]);
      setSwappableSlots(slotsResponse.data.swappableSlots);
      setMySwappableSlots(eventsResponse.data.events.filter(e => e.status === 'SWAPPABLE'));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setShowSwapModal(true);
  };

  const handleConfirmSwap = async (mySlotId) => {
    try {
      await swapAPI.createSwapRequest({
        mySlotId: mySlotId,
        theirSlotId: selectedSlot.id
      });
      alert('Swap request sent successfully!');
      setShowSwapModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create swap request');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Marketplace</h1>
      <p className="text-gray-600 mb-6">Browse and request swaps with other users' available slots</p>

      {swappableSlots.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No swappable slots available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {swappableSlots.map((slot) => (
            <div key={slot.id} className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{slot.title}</h3>
                  <p className="text-gray-600 mt-1">
                    {format(new Date(slot.start_time), 'PPpp')} - {format(new Date(slot.end_time), 'p')}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Offered by: {slot.owner_name} ({slot.owner_email})
                  </p>
                </div>
                <button
                  onClick={() => handleRequestSwap(slot)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  disabled={mySwappableSlots.length === 0}
                >
                  Request Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Select Your Slot to Offer</h2>
            <p className="text-gray-600 mb-4">You are requesting: {selectedSlot.title}</p>
            
            {mySwappableSlots.length === 0 ? (
              <p className="text-red-600 mb-4">You have no swappable slots. Please make a slot swappable first.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {mySwappableSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleConfirmSwap(slot.id)}
                    className="p-4 border border-gray-300 rounded-md cursor-pointer hover:bg-indigo-50 hover:border-indigo-500"
                  >
                    <h4 className="font-semibold">{slot.title}</h4>
                    <p className="text-sm text-gray-600">
                      {format(new Date(slot.start_time), 'PPpp')} - {format(new Date(slot.end_time), 'p')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowSwapModal(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};